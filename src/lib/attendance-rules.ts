export const ATTENDANCE_RULES = {
	// Late minutes are calculated starting from this time
	workStartHour: 8,
	workStartMinute: 0,
	// Arriving after this time is considered late
	lateThresholdHour: 8,
	lateThresholdMinute: 10,
	workEndHour: 17,
	workEndMinute: 0,
} as const;
