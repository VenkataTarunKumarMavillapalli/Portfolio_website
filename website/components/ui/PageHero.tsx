import { Shell } from "./Shell";
export function PageHero({title,description}: {title:string;description:string}) {
  return <section className="page-heading"><Shell><h1>{title}</h1><p>{description}</p></Shell></section>;
}
