export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
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

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username.trim()]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email hoặc tên người dùng đã tồn tại' },
        { status: 400 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = await query(
      `INSERT INTO users (username, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, username, email`,
      [username.trim(), email.toLowerCase(), passwordHash]
    );

    const user = result.rows[0];

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error('Error in auth register:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi trong quá trình đăng ký' },
      { status: 500 }
    );
  }
}
