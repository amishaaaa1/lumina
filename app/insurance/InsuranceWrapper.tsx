'use client';

import { useSearchParams } from 'next/navigation';
import InsuranceClient from './InsuranceClient';

export default function InsuranceWrapper() {
  const searchParams = useSearchParams();
  const marketParam = searchParams.get('market');
  
  return <InsuranceClient marketParam={marketParam} />;
}
