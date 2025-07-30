import { supabase } from './supabase';

export interface BuildingInfoData {
  id: string;
  user_id: string;
  building_name: string;
  address: string;
  phone: string;
  emergency_contact: string;
  emergency_phone: string;
  created_at: string;
  updated_at: string;
}

export const buildingService = {
  async getBuildingInfo(userId: string): Promise<BuildingInfoData | null> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('building_information')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }

    return data;
  },

  async createOrUpdateBuildingInfo(userId: string, buildingData: Partial<BuildingInfoData>): Promise<BuildingInfoData> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('building_information')
      .upsert({
        user_id: userId,
        ...buildingData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBuildingInfo(userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('building_information')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
}; 