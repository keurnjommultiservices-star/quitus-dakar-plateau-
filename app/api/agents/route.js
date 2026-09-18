import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: 'Session invalide.' }, { status: 401 });
  }

  const { data: profil } = await supabaseAdmin
    .from('profils_agents')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (profil?.role !== 'superviseur') {
    return NextResponse.json({ error: 'Action réservée au superviseur.' }, { status: 403 });
  }

  const { email, motDePasse, nomComplet, role } = await request.json();

  if (!email || !motDePasse || !['agent', 'superviseur'].includes(role)) {
    return NextResponse.json({ error: 'Champs invalides.' }, { status: 400 });
  }

  const { data: nouvelUtilisateur, error: creationError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: motDePasse,
      email_confirm: true,
    });

  if (creationError) {
    return NextResponse.json({ error: creationError.message }, { status: 400 });
  }

  const { error: profilError } = await supabaseAdmin.from('profils_agents').insert({
    user_id: nouvelUtilisateur.user.id,
    role,
    nom_complet: nomComplet || null,
  });

  if (profilError) {
    return NextResponse.json({ error: profilError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
