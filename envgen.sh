#!/bin/bash

# Function to generate a secure random secret key
generate_secret_key() {
  echo "$(openssl rand -base64 32)"  # Generate a 256-bit random key encoded in base64
}

# Save the keys to a .env file
save_secret_keys() {
  local file_name=".env"

  echo "Saving keys to $file_name..."

  # Write the keys to the .env file
  {
    echo "JWT_SECRET_KEY=$JWT_SECRET_KEY"
    echo "JWT_REFRESH_SECRET_KEY=$JWT_REFRESH_SECRET_KEY"
  } > "$file_name"

  echo "Keys saved to $file_name"
}

# Generate the keys
echo "Generating JWT keys..."
JWT_SECRET_KEY=$(generate_secret_key)
JWT_REFRESH_SECRET_KEY=$(generate_secret_key)

# Display the generated keys
echo "Generated JWT_SECRET_KEY:"
echo "$JWT_SECRET_KEY"
echo
echo "Generated JWT_REFRESH_SECRET_KEY:"
echo "$JWT_REFRESH_SECRET_KEY"
echo

# Save the keys to a .env file
read -p "Do you want to save the keys to a .env file? (y/n): " save_keys
if [[ "$save_keys" == "y" ]]; then
  save_secret_keys
else
  echo "Keys were not saved. Make sure to copy them if needed."
fi
