-- Add Whop account linking columns to profiles
ALTER TABLE profiles ADD COLUMN whop_user_id text;
ALTER TABLE profiles ADD COLUMN whop_access_token text;
ALTER TABLE profiles ADD COLUMN whop_refresh_token text;
ALTER TABLE profiles ADD COLUMN whop_token_expires_at timestamp with time zone;
ALTER TABLE profiles ADD COLUMN whop_linked_at timestamp with time zone;

-- Create index for faster lookups
CREATE INDEX idx_profiles_whop_user_id ON profiles(whop_user_id);

-- Allow users to update their Whop connection
CREATE POLICY "Users can update whop connection"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);