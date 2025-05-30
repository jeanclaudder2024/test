import { SVGProps } from "react";

export function LawJustice(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 4V6" />
      <path d="M6 8H18C18 8 17 13 12 13C7 13 6 8 6 8Z" />
      <path d="M8.5 17h7" />
      <path d="M7 17h10v3H7v-3z" />
      <path d="M12 13v4" />
    </svg>
  );
}