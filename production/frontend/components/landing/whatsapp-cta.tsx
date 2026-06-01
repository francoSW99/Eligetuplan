'use client';

import Image from 'next/image';
import { track, type LeadSource } from '@/lib/analytics';

const WHATSAPP_BASE = 'https://wa.me/56968319807';

type WhatsAppCTAProps = {
  source: LeadSource;
  message: string;
  label: string;
  /** "whatsapp" = verde WhatsApp; "solid" = gradiente de marca */
  variant?: 'whatsapp' | 'solid';
  className?: string;
};

export default function WhatsAppCTA({
  source,
  message,
  label,
  variant = 'whatsapp',
  className = '',
}: WhatsAppCTAProps) {
  const url = `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
  const base =
    'inline-flex items-center justify-center gap-2.5 font-bold rounded-2xl px-7 py-4 text-base shadow-lg transition-all hover:-translate-y-0.5 no-underline';
  const variantClass =
    variant === 'whatsapp'
      ? 'bg-[#25D366] text-white hover:bg-[#20bd5a]'
      : 'text-white';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track.whatsappClick(source)}
      className={`${base} ${variantClass} ${className}`}
      style={variant === 'solid' ? { background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' } : undefined}
    >
      <Image src="/wsp2.png" alt="" width={22} height={22} className="w-[22px] h-[22px]" />
      {label}
    </a>
  );
}
