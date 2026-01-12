if (Test-Path .env.example) {
    $content = Get-Content .env.example -Raw
    $content = $content -replace 'sk_test_[a-zA-Z0-9]{24,}', 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE'
    $content = $content -replace 'pk_test_[a-zA-Z0-9]{24,}', 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE'
    $content = $content -replace 'whsec_[a-zA-Z0-9]{24,}', 'whsec_YOUR_STRIPE_WEBHOOK_SECRET_HERE'
    $content = $content -replace 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxx', 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE'
    $content = $content -replace 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx', 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE'
    $content = $content -replace 'whsec_xxxxxxxxxxxxxxxxxxxxxxxx', 'whsec_YOUR_STRIPE_WEBHOOK_SECRET_HERE'
    Set-Content .env.example -Value $content -NoNewline
}
