export const stageColors: Record<string, string> = {
  NEGOTIATION: '#9C27B0',
  QUALIFICATION: '#51CF66',
  IDENTIFY_DECISION_MAKERS: '#FF9800',
  PROPOSAL: '#339Af0',
  CLOSE: '#3F51B5',
};

export function getStageColor(stage: string): string {
  return stageColors[stage] || '#757575';
}
export const stageChipStyles = {
  color: 'white !important',
  fontWeight: 'bold',
  fontSize: '0.75rem',
  height: '28px',
  borderRadius: '12px',
  minWidth: '120px',
  boxShadow:
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px rgba(0,0,0,0.14),0px 1px 3px rgba(0,0,0,0.12)',
};
