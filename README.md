# MyWardBulletin

## Custom Branding and Theme

You can change or remove all branding by editing the following variables in your `.env` file:

```bash
VITE_APP_NAME=MyWardBulletin
VITE_APP_TAGLINE=Ward Bulletin Creator
```

Set either value to an empty string to omit it from the UI. Fonts and colors are defined in `tailwind.config.js` and `src/index.css`. Feel free to adjust these files to fit your preferred style.

This project uses environment variables to configure Supabase credentials. To connect the application to your own Supabase project:

1. Copy `.env.example` to `.env` in the project root.
2. Edit the new `.env` file and replace the placeholder values with your Supabase URL and anon key.
   Both `VITE_SUPABASE_*` variables are required for the Vite build, and the `SUPABASE_*` aliases are used by serverless functions.

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your-anon-key
  ```

3. Restart your development server or redeploy the site so the new variables take effect.

In addition to the Supabase credentials, you can configure the domain names used when generating share links and QR codes. Add the following variables to your `.env` file if you want to override the defaults:

```
VITE_FULL_DOMAIN=mywardbulletin.com
VITE_SHORT_DOMAIN=mwbltn.com
```

The `.env` file is listed in `.gitignore` to keep your credentials private. If you intend to keep the entire project private, ensure your source-control platform (such as GitHub) is configured to make the repository private as well.



## Bulletin Templates

- Use **Save as Template** to store the current bulletin layout locally.
- Choose **New Bulletin** to open the template picker and start from a saved template or a blank bulletin.
- Templates are saved securely for your account and can be accessed from any device where you sign in.
