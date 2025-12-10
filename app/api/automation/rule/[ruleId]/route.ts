import { updateAutomationRule, deleteAutomationRule } from '@/lib/supabase/queries';

export async function PATCH(
  request: Request,
  { params }: { params: { ruleId: string } }
) {
  try {
    const { ruleId } = params;
    const body = await request.json();

    const success = await updateAutomationRule(ruleId, body);
    
    if (success) {
      return Response.json({ success: true });
    } else {
      return Response.json({ error: 'Failed to update rule' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Failed to update rule:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { ruleId: string } }
) {
  try {
    const { ruleId } = params;

    const success = await deleteAutomationRule(ruleId);
    
    if (success) {
      return Response.json({ success: true });
    } else {
      return Response.json({ error: 'Failed to delete rule' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Failed to delete rule:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
