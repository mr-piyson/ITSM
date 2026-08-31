export type RequestFormData = {
	requesterName: string;
	requesterManager: string;
	department: string;
	location: string;
	softwareMES: boolean;
	softwareOffice365: boolean;
	softwareEPICOR: boolean;
	softwareOther: string;
	similarPermissions: string;
	hardwareSelection: string;
	hardwareOther: string;
	sharedFilesAccess: string;
	othersSpecify: string;
	justification: string;
};

export const emptyRequestForm: RequestFormData = {
	requesterName: "",
	requesterManager: "",
	department: "",
	location: "",
	softwareMES: false,
	softwareOffice365: false,
	softwareEPICOR: false,
	softwareOther: "",
	similarPermissions: "",
	hardwareSelection: "",
	hardwareOther: "",
	sharedFilesAccess: "",
	othersSpecify: "",
	justification: "",
};

export type RequestFormField = keyof RequestFormData;
