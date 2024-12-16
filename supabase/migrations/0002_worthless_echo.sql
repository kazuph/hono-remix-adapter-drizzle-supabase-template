-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users_public_view" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR (email IS NULL AND bio IS NULL));

CREATE POLICY "users_self_update" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_self_view_details" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "posts_public_view" ON posts
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "posts_private_view" ON posts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "posts_insert" ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "posts_modify" ON posts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "posts_delete" ON posts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
