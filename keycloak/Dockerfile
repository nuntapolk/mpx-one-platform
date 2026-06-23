# Keycloak for Railway — bakes realm import + start command into the image
# so no dashboard "custom start command" is needed.
FROM quay.io/keycloak/keycloak:24.0

# Import the MPX-ONE realm (clients, roles, seed users) on first boot.
COPY mpx-one-realm.json /opt/keycloak/data/import/mpx-one-realm.json

# KC_DB_*, KC_PROXY, KC_HOSTNAME, KEYCLOAK_ADMIN* come from Railway env vars.
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--import-realm"]
