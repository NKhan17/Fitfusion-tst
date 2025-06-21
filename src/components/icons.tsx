import type { SVGProps } from 'react';

export function FitFusionLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2l3.09 6.31L22 9.31l-5 4.87 1.18 6.88L12 17.47l-6.18 3.59L7 14.18l-5-4.87 6.91-1L12 2z" />
      <path d="M12 2v15.47" />
    </svg>
  );
}
