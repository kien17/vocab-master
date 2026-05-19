export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email và password đều bắt buộc' },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email.toLowerCase()},username.eq.${username.trim()}`)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email hoặc tên người dùng đã tồn tại' },
        { status: 400 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username: username.trim(),
        email: email.toLowerCase(),
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, username, email')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error('Error in auth register:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi trong quá trình đăng ký' },
      { status: 500 }
    );
  }
}
