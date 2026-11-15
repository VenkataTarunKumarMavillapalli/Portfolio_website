import { Shell } from "./Shell";
import { MotionBlock } from "./MotionBlock";
import { Label } from "./Label";

export function PageHero({label,title,description,children}: {label:string;title:React.ReactNode;description:string;children?:React.ReactNode}) {
  return <section className="page-hero"><Shell><MotionBlock className="hero-inner"><Label dark>{label}</Label><h1>{title}</h1><p>{description}</p>{children}</MotionBlock></Shell></section>;
}
