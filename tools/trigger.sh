#!/usr/bin/env bash
set -euo pipefail

API_URL=${API_URL:-http://localhost:3000}
OPERATION=""
USER_ID=""
DOOR_ID=""
BUILDING_ID=""
READER_ID=""
EMAIL=""
PASSWORD=""
REFRESH_TOKEN=""

usage() {
  echo "Usage: $0 --operation <operation> [args]"
  echo ""
  echo "Operations:"
  echo "  login                     --email <email> --password <password>"
  echo "                            User authentication. Returns: accessToken, refreshToken, and user data."
  echo ""
  echo "  refresh                   --refreshToken <token>"
  echo "                            Renews expired accessToken using refreshToken. Returns new accessToken."
  echo ""
  echo "  logout                    --token <token>"
  echo "                            Invalidates user session. Requires valid accessToken."
  echo ""
  echo "  getUser                   --userId <id> --token <token>"
  echo "  grantAccess               --userId <id> --doorId <id> --token <token>"
  echo "  openDoor                  --userId <id> --doorId <id> --token <token>"
  echo "  deleteAllUsersInBuilding  --buildingId <id> --token <token>"
  echo "  getReaderWithDevice       --readerId <id> --token <token>"
  echo ""
  echo "  populateCache             --token <token>"
  echo "                            Loads all system data into Redis cache."
  echo ""
  echo "  ✨ NEW FUNCTIONALITIES:"
  echo "  getUserAccessesInBuilding --userId <id> --buildingId <id> --token <token>"
  echo "                            Returns all access events for a specific user in a specific building."
  echo ""
  echo "  openAllDoorsInBuilding    --buildingId <id> --token <token>"
  echo "                            Opens all doors in a specific building."
  echo ""
  exit 1
}

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --operation) OPERATION="$2"; shift ;; 
        --userId) USER_ID="$2"; shift ;; 
        --doorId) DOOR_ID="$2"; shift ;; 
        --buildingId) BUILDING_ID="$2"; shift ;; 
        --readerId) READER_ID="$2"; shift ;; 
        --email) EMAIL="$2"; shift ;; 
        --password) PASSWORD="$2"; shift ;; 
        --refreshToken) REFRESH_TOKEN="$2"; shift ;; 
        --token) TOKEN="$2"; shift ;; 
        *) echo "Unknown parameter passed: $1"; usage ;; 
    esac
    shift
done

if [ -z "$OPERATION" ]; then
    echo "Error: --operation parameter is required."
    usage
fi

case "$OPERATION" in
    # Authentication: Login - Obtains accessToken and refreshToken
    login)
        if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
            echo "Error: Both --email and --password are required for login operation."
            exit 1
        fi
        echo "🔐 Authenticating user: $EMAIL"
        echo "   → Returns: accessToken, refreshToken, and user data"
        curl -sS -X POST "$API_URL/auth/login" \
            -H 'Content-Type: application/json' \
            -d '{"email": "'"$EMAIL"'", "password": "'"$PASSWORD"'"}' | jq .
        ;;

    # Token Refresh - Renews expired accessToken
    refresh)
        if [ -z "$REFRESH_TOKEN" ]; then
            echo "Error: --refreshToken is required for refresh operation."
            exit 1
        fi
        echo "🔄 Renewing expired accessToken..."
        echo "   → Returns: new accessToken with extended validity"
        curl -sS -X POST "$API_URL/auth/refresh" \
          -H 'Content-Type: application/json' \
          -d "{"refreshToken": "$REFRESH_TOKEN"}" | jq .
        ;;

    # Session Termination - Invalidates user session
    logout)
        if [ -z "$TOKEN" ]; then
            echo "Error: --token is required for logout operation."
            exit 1
        fi
        echo "🚪 Terminating user session..."
        echo "   → The accessToken will be invalidated and cannot be reused"
        curl -sS -X POST "$API_URL/auth/logout" \
          -H "Authorization: Bearer $TOKEN" | jq .
        ;;

    getUser)
        if [ -z "$USER_ID" ] || [ -z "$TOKEN" ]; then
            echo "Error: Both --userId and --token are required for getUser operation."
            exit 1
        fi
        echo "Executing: GET User $USER_ID"
        curl -sS -X GET "$API_URL/users/$USER_ID" \
          -H "Authorization: Bearer $TOKEN" | jq .
        ;; 

    grantAccess)
        if [ -z "$USER_ID" ] || [ -z "$DOOR_ID" ] || [ -z "$TOKEN" ]; then
            echo "Error: Both --userId, --doorId and --token are required for grantAccess operation."
            exit 1
        fi
        echo "Executing: Grant Access to Door $DOOR_ID for User $USER_ID"
        curl -sS -X POST "$API_URL/access/grant" \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $TOKEN" \
          -d "{"userId": $USER_ID, "doorId": $DOOR_ID}" | jq .
        ;; 

    openDoor)
        if [ -z "$USER_ID" ] || [ -z "$DOOR_ID" ] || [ -z "$TOKEN" ]; then
            echo "Error: Both --userId, --doorId and --token are required for openDoor operation."
            exit 1
        fi
        echo "Executing: Open Door $DOOR_ID for User $USER_ID"
        curl -sS -X POST "$API_URL/access/open" \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $TOKEN" \
          -d "{"userId": $USER_ID, "doorId": $DOOR_ID}" | jq .
        ;; 

    deleteAllUsersInBuilding)
        if [ -z "$BUILDING_ID" ] || [ -z "$TOKEN" ]; then
            echo "Error: Both --buildingId and --token are required for deleteAllUsersInBuilding operation."
            exit 1
        fi
        echo "Executing: Delete All Users in Building $BUILDING_ID"
        curl -sS -X DELETE "$API_URL/buildings/$BUILDING_ID/users" \
          -H "Authorization: Bearer $TOKEN" | jq .
        ;; 

    getReaderWithDevice)
        if [ -z "$READER_ID" ] || [ -z "$TOKEN" ]; then
            echo "Error: Both --readerId and --token are required for getReaderWithDevice operation."
            exit 1
        fi
        echo "Executing: GET Reader with device $READER_ID"
        curl -sS -X GET "$API_URL/readers?readerId=$READER_ID" \
          -H "Authorization: Bearer $TOKEN" | jq .
        ;;

    # Cache Management - Pre-loads data into Redis
    populateCache)
        if [ -z "$TOKEN" ]; then
            echo "Error: --token is required for populateCache operation."
            exit 1
        fi
        echo "💾 Populating Redis cache with system data..."
        echo "   ⏳ This operation may take a few seconds"
        curl -sS -X POST "$API_URL/cache/populate-cache" \
          -H "Authorization: Bearer $TOKEN" | jq .
        ;; 

    # ✨ NOVA FUNCIONALIDADE 3.1 - Buscar acessos de usuário em prédio específico
    getUserAccessesInBuilding)
        if [ -z "$USER_ID" ] || [ -z "$BUILDING_ID" ] || [ -z "$TOKEN" ]; then
            echo "Error: --userId, --buildingId and --token are required for getUserAccessesInBuilding operation."
            exit 1
        fi
        echo "🔍 Getting access events for User $USER_ID in Building $BUILDING_ID"
        echo "   → Returns: all access events for the specified user in the specified building"
        curl -sS -X GET "$API_URL/access/user/$USER_ID/building/$BUILDING_ID" \
          -H "Authorization: Bearer $TOKEN" | jq .
        ;;

    # ✨ NOVA FUNCIONALIDADE 3.2 - Abrir todas as portas de um prédio
    openAllDoorsInBuilding)
        if [ -z "$BUILDING_ID" ] || [ -z "$TOKEN" ]; then
            echo "Error: --buildingId and --token are required for openAllDoorsInBuilding operation."
            exit 1
        fi
        echo "🚪 Opening ALL doors in Building $BUILDING_ID"
        echo "   → This will send open commands to every door in the building"
        curl -sS -X POST "$API_URL/buildings/$BUILDING_ID/open-all" \
          -H "Authorization: Bearer $TOKEN" | jq .
        ;;

    *)
        echo "Error: Unknown operation '$OPERATION'."
        usage
        ;; 
esac