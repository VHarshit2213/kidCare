import { Badge } from "@/components/ui/badge";

interface SkillProps {
  name: string;
}

export default function Skill({ name }: SkillProps) {
  // Map skill names to appropriate variants
  const getVariant = (skill: string) => {
    const skillMap: Record<string, any> = {
      "First Aid": "firstAid",
      "Teacher": "teacher",
      "Art & Craft": "art",
      "Sports": "sports",
      "Cooking": "cooking",
      "Music": "music",
      "Multilingual": "multilingual",
    };
    
    return skillMap[skill] || "skill";
  };

  return (
    <Badge variant={getVariant(name)}>{name}</Badge>
  );
}
