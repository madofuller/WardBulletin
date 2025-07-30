-- Create building_information table
CREATE TABLE IF NOT EXISTS building_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  building_name text,
  address text,
  phone text,
  emergency_contact text,
  emergency_phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Ensure each user can only have one building info record
CREATE UNIQUE INDEX IF NOT EXISTS unique_building_info_user_id ON building_information(user_id);

-- Enable RLS
ALTER TABLE building_information ENABLE ROW LEVEL SECURITY;

-- RLS policies for building_information
CREATE POLICY "Users can view own building info" ON building_information
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own building info" ON building_information
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own building info" ON building_information
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own building info" ON building_information
FOR DELETE USING (auth.uid() = user_id); 