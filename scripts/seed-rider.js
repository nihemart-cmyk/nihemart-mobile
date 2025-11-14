const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment from .env.local if present (Next/Expo convention), otherwise fall back to .env
const envFiles = [
   path.resolve(process.cwd(), ".env.local"),
   path.resolve(process.cwd(), ".env"),
];
let loaded = null;
for (const p of envFiles) {
   if (fs.existsSync(p)) {
      const result = dotenv.config({ path: p });
      if (!result.error) {
         loaded = p;
         break;
      }
   }
}
if (!loaded) dotenv.config();

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
   process.env.SUPABASE_URL ||
   process.env.EXPO_PUBLIC_SUPABASE_URL ||
   process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
   process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
   console.error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
   );
   console.error("Environment files checked:", envFiles.join(", "));
   console.error("Loaded .env path:", loaded || "none");
   process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
   auth: { persistSession: false },
});

// Defaults (override via env vars)
const RIDER_EMAIL = process.env.SEED_RIDER_EMAIL || "rider@nihemart.rw";
const RIDER_PASSWORD = process.env.SEED_RIDER_PASSWORD || "@NiheRider1!";
const RIDER_FULL_NAME = process.env.SEED_RIDER_FULL_NAME || "Test Rider";
const RIDER_PHONE = process.env.SEED_RIDER_PHONE || "0770000000";
const RIDER_VEHICLE = process.env.SEED_RIDER_VEHICLE || "Motorbike";

async function run() {
   try {
      console.log("Looking for existing user with email:", RIDER_EMAIL);

      // Try to list users via admin API
      let existingUser = null;
      try {
         const { data: existingUserData, error: listErr } =
            await supabase.auth.admin.listUsers();
         if (listErr) {
            console.warn("listUsers error:", listErr.message || listErr);
         } else if (existingUserData && Array.isArray(existingUserData.users)) {
            existingUser =
               existingUserData.users.find((u) => u.email === RIDER_EMAIL) ||
               null;
         }
      } catch (e) {
         console.warn("admin.listUsers thrown:", e?.message || e);
      }

      if (!existingUser) {
         console.log("Creating rider user via admin API...");
         const { data, error } = await supabase.auth.admin.createUser({
            email: RIDER_EMAIL,
            password: RIDER_PASSWORD,
            email_confirm: true,
            user_metadata: {
               full_name: RIDER_FULL_NAME,
               phone: RIDER_PHONE,
            },
         });
         if (error) {
            console.error("Error creating user:", error.message || error);
            process.exit(1);
         }
         existingUser = data.user || null;
         console.log("Created user id=", existingUser?.id);
      } else {
         console.log("User already exists, id=", existingUser.id);
         // Attempt to ensure password and metadata are set
         try {
            console.log("Updating password for existing user...");
            const { data: upd, error: updErr } =
               await supabase.auth.admin.updateUserById(existingUser.id, {
                  password: RIDER_PASSWORD,
               });
            if (updErr)
               console.warn(
                  "Warning: updateUserById password error:",
                  updErr.message || updErr
               );
         } catch (e) {
            console.warn("updateUserById thrown:", e?.message || e);
         }

         try {
            const { data: upd2, error: upd2Err } =
               await supabase.auth.admin.updateUserById(existingUser.id, {
                  user_metadata: {
                     full_name: RIDER_FULL_NAME,
                     phone: RIDER_PHONE,
                  },
               });
            if (upd2Err)
               console.warn(
                  "Warning: updateUserById metadata error:",
                  upd2Err.message || upd2Err
               );
         } catch (e) {
            console.warn("updateUserById thrown:", e?.message || e);
         }
      }

      const userId = existingUser.id;

      // Upsert profile row in public.profiles
      console.log("Upserting public.profiles for user id:", userId);
      const { error: upsertProfileErr } = await supabase
         .from("profiles")
         .upsert(
            {
               id: userId,
               full_name: RIDER_FULL_NAME,
               phone: RIDER_PHONE,
            },
            { onConflict: "id" }
         )
         .select();
      if (upsertProfileErr) {
         console.error(
            "Error upserting profile:",
            upsertProfileErr.message || upsertProfileErr
         );
         process.exit(1);
      }

      // Upsert rider role in public.user_roles
      console.log("Upserting rider role in public.user_roles");
      const { error: upsertRoleErr } = await supabase
         .from("user_roles")
         .upsert(
            { user_id: userId, role: "rider" },
            { onConflict: "user_id,role" }
         );
      if (upsertRoleErr) {
         console.error(
            "Error upserting user_roles:",
            upsertRoleErr.message || upsertRoleErr
         );
         process.exit(1);
      }

      // Ensure riders row exists for this user. Many schemas don't have a
      // unique constraint on `user_id`, so avoid ON CONFLICT upsert and do a
      // select -> update/insert flow instead.
      console.log("Ensuring riders row for user id:", userId);
      try {
         const { data: existingRider } = await supabase
            .from("riders")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

         if (existingRider && existingRider.id) {
            console.log("Rider row exists, updating id:", existingRider.id);
            const { error: updErr } = await supabase
               .from("riders")
               .update({
                  full_name: RIDER_FULL_NAME,
                  phone: RIDER_PHONE,
                  vehicle: RIDER_VEHICLE,
                  active: true,
               })
               .eq("id", existingRider.id);
            if (updErr) {
               console.error(
                  "Error updating riders:",
                  updErr.message || updErr
               );
               process.exit(1);
            }
         } else {
            console.log("No existing rider row, inserting new one");
            const { error: insErr } = await supabase.from("riders").insert([
               {
                  user_id: userId,
                  full_name: RIDER_FULL_NAME,
                  phone: RIDER_PHONE,
                  vehicle: RIDER_VEHICLE,
                  active: true,
               },
            ]);
            if (insErr) {
               console.error(
                  "Error inserting riders:",
                  insErr.message || insErr
               );
               process.exit(1);
            }
         }
      } catch (e) {
         console.error("Error ensuring riders row:", e?.message || e);
         process.exit(1);
      }

      console.log("✅ Rider seeded successfully:", RIDER_EMAIL);
      console.log(
         "You can now sign in with that email and password in the app."
      );
      console.log("User ID:", userId);
   } catch (err) {
      console.error("Unexpected error:", err?.message || err);
      process.exit(1);
   }
}

run();
