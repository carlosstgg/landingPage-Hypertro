import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const MAX_FOUNDERS = 1000;

// Generate a unique promo code
function generatePromoCode(): string {
  const prefix = 'HYPERTRO';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

// GET: Check waitlist status (current count and availability)
export async function GET() {
  try {
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al obtener el estado.' },
        { status: 500 }
      );
    }

    const currentCount = count || 0;
    const spotsLeft = Math.max(0, MAX_FOUNDERS - currentCount);
    const isFull = currentCount >= MAX_FOUNDERS;

    return NextResponse.json({
      currentCount,
      maxFounders: MAX_FOUNDERS,
      spotsLeft,
      isFull,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

// POST: Register new user to waitlist
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Por favor, ingresa un email válido.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('waitlist')
      .select('promo_code')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { 
          message: '¡Ya estás en la lista!',
          promoCode: existingUser.promo_code,
          alreadyRegistered: true
        },
        { status: 200 }
      );
    }

    // Check if waitlist is full
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (count && count >= MAX_FOUNDERS) {
      return NextResponse.json(
        { 
          error: '¡La promoción de Fundadores ha terminado! Las 1000 plazas ya han sido ocupadas.',
          isFull: true
        },
        { status: 410 } // 410 Gone - Resource no longer available
      );
    }

    // Generate unique promo code
    let promoCode = generatePromoCode();
    let attempts = 0;
    const maxAttempts = 5;

    // Ensure promo code is unique
    while (attempts < maxAttempts) {
      const { data: existingCode } = await supabase
        .from('waitlist')
        .select('id')
        .eq('promo_code', promoCode)
        .single();

      if (!existingCode) break;
      promoCode = generatePromoCode();
      attempts++;
    }

    // Insert new waitlist entry
    const { error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase(),
        promo_code: promoCode,
      });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Hubo un error al registrarte. Inténtalo de nuevo.' },
        { status: 500 }
      );
    }

    // Get updated count to return spots left
    const { count: newCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json(
      { 
        message: '¡Te has registrado exitosamente!',
        promoCode: promoCode,
        alreadyRegistered: false,
        spotsLeft: Math.max(0, MAX_FOUNDERS - (newCount || 0))
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
