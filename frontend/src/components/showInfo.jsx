import { CarInfoCard } from "./CarInfoCard";

function showInfo(car, user, onRent) {
    return <CarInfoCard car={car} user={user} onRent={onRent} />;
}