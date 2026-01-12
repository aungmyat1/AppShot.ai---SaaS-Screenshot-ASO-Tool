#!/bin/bash
if [ -f .env.example ]; then
    sed -i.bak 's/sk_test_[a-zA-Z0-9]\{24,\}/sk_test_YOUR_STRIPE_SECRET_KEY_HERE/g' .env.example
    sed -i.bak 's/pk_test_[a-zA-Z0-9]\{24,\}/pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE/g' .env.example
    sed -i.bak 's/whsec_[a-zA-Z0-9]\{24,\}/whsec_YOUR_STRIPE_WEBHOOK_SECRET_HERE/g' .env.example
    sed -i.bak 's/sk_test_xxxxxxxxxxxxxxxxxxxxxxxx/sk_test_YOUR_STRIPE_SECRET_KEY_HERE/g' .env.example
    sed -i.bak 's/pk_test_xxxxxxxxxxxxxxxxxxxxxxxx/pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE/g' .env.example
    sed -i.bak 's/whsec_xxxxxxxxxxxxxxxxxxxxxxxx/whsec_YOUR_STRIPE_WEBHOOK_SECRET_HERE/g' .env.example
    rm -f .env.example.bak
fi
