export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và password đều bắt buộc' },
        { status: 400 }
      );
    }

    const userResult = await query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];
    const isValid = bcrypt.compareSync(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in auth login:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi trong quá trình đăng nhập' },
      { status: 500 }
    );
  }
}
