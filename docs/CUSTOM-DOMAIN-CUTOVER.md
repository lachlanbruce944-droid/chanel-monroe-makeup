# Chanel Monroe domain cutover

Use the website repository’s **Settings → Pages** to configure `chanelmonroe.net` after domain verification. Review the website and CRM changes together before enabling public intake at the custom domain.

1. Verify the domain on the GitHub account using GitHub’s TXT challenge.
2. Set the custom domain in the makeup website’s Pages settings. The workflow publishes the `site/` directory.
3. At the DNS provider, update the apex web records to the [GitHub Pages addresses](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain). If using `www`, point it to `lachlanbruce944-droid.github.io`. Preserve the mail MX records and Microsoft 365 verification, SPF, DKIM and DMARC records.
4. Once Pages provisions the certificate, enforce HTTPS. Verify the home page has the makeup site title and links to the enquiry. Confirm the enquiry route, its stylesheet/scripts and media load over HTTPS. Run the synthetic booking smoke test in staging.
5. If the domain routes to the wrong project, restore the previous web records from the DNS snapshot and recheck the original domain and Microsoft 365 mail records.

Read-only checks on 25 November 2026 returned HTTP 200 for the custom-domain homepage and HTTP 404 for its enquiry page. Changing a tracked file alone cannot repair that DNS routing.
