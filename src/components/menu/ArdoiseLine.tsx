import { ardoise } from "@/lib/data";
import { InlineScript } from "@/components/status/InlineScript";

// « L'ardoise du mois »: shown only during its month (checked in the visitor's browser, Paris time);
// otherwise the generic line. Updated monthly in content/ardoise.json.
export function ArdoiseLine({ className = "" }: { className?: string }) {
  const generic = "Suggestions et broche du jour selon arrivage, sur l'ardoise au restaurant.";
  if (!ardoise.month || ardoise.items.length === 0) return <p className={className}>{generic}</p>;
  const monthly = `À l'ardoise ce mois-ci : ${ardoise.items.map((i) => i.name).join(", ")}.`;
  const script = `try{var m=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit"}).format(new Date()).slice(0,7);var els=document.querySelectorAll("[data-ardoise]");for(var i=0;i<els.length;i++){els[i].textContent=m===${JSON.stringify(ardoise.month)}?${JSON.stringify(monthly)}:${JSON.stringify(generic)};}}catch(e){}`;
  return (
    <>
      <p className={className} data-ardoise suppressHydrationWarning>
        {generic}
      </p>
      <InlineScript html={script} />
    </>
  );
}
