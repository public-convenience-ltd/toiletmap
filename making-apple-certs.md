## Dev certs

1. Create a Cert Signing Request for the Apple Mac Machine you're using
1. Log into apple developer and visit the account section (at the time of writing: https://developer.apple.com/account)
1. Visit **Certificates, Identifiers & Profiles** and create a certificate
    - *n.b.* make sure you remember if it's a a **Distribution cert** or a **Developer cert**
1. Download the cert and create a p12 export of the cert:
    - importing the cert into KeyChain access, by either double clicking or dragging and dropping into Keychain access
    - this can be in your login Keychain
    - right click the Certificate
    - click export
1. Go back to the apple developer portal and visit **Profiles**
1. Add a profile, make sure the profile matches the **Certificate** you created for point 3
1. Download the profile

The p12 and profile can now be uploaded to phonegap!
