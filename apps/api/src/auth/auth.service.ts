import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    ) as SupabaseClient;
  }

  async validateToken(token: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return data.user;
  }
}
