import { Badge } from "@/components/ui/badge";

interface SkillProps {
  name: string;
}

export default function Skill({ name }: SkillProps) {
  return (
    <Badge variant="secondary" className="py-1 px-2">
      {name}
    </Badge>
  );
}