import { Card, CardContent, CardFooter } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { BadgeCheck, MapPin, Star, Stethoscope } from "lucide-react";
import { Button } from "../ui/button";

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  hospital: string;
  rating: number;
  reviews: number;
  location: string;
  fee: number;
  verified: boolean;
  image?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (id: string) => void;
  onViewProfile: (id: string) => void;
}

export default function DoctorCard({
  doctor,
  onBook,
  onViewProfile,
}: DoctorCardProps) {
  // Mapping API data to UI (Handling your specific data structure)
  const {
    _id,
    fullName,
    specialization,
    hospital,
    rating,
    reviews,
    location,
    fee,
    verified,
  } = doctor;

  const initials = fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border-muted">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarImage src={doctor.image} alt={fullName} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-none tracking-tight text-foreground">
                {fullName}
              </h3>
              {verified && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-1.5"
                >
                  <BadgeCheck className="h-3.5 w-3.5 mr-1" /> Verified
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium text-primary flex items-center gap-1">
              <Stethoscope className="h-3.5 w-3.5" />
              {specialization || "General Practitioner"}
            </p>

            <p className="text-sm text-muted-foreground">
              {hospital || "Medical Center"} • {location || "Remote"}
            </p>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {rating || "4.8"}{" "}
                <span className="text-muted-foreground font-normal">
                  ({reviews || 0})
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {location}
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col justify-between h-16">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Fee
            </span>
            <span className="text-2xl font-bold text-foreground">
              ${fee || "50"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-3">
        <Button className="flex-1" onClick={() => onBook(_id)}>
          Book Now
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewProfile(_id)}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
