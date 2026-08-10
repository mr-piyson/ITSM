type SignInValues = {
	email: string;
	password: string;
};

/**
 * Client-side sign in - calls the API
 */
export async function signIn(formData: SignInValues) {
	const res = await fetch("/api/auth/signin", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(formData),
	});
	return res.json();
}

/**
 * Client-side sign out - calls the API
 */
export async function signOut() {
	const res = await fetch("/api/auth/signout", { method: "POST" });
	const data = await res.json();
	if (data.redirect) {
		window.location.href = data.redirect;
	}
	return data;
}
