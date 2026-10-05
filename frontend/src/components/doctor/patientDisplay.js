
export function toDisplayStatus(status) {
    return status === "checked-in" || status === "in-room" ? "waiting" : status;
}

export function toDisplayVisitType(visitType) {
    return visitType === "New Consultation" ? "New Consultation" : "Follow-up";
}
