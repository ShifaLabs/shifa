export function invitationTemplate(name: string, link: string) {
  return `
    <h2>Hello ${name}</h2>
    <p>You have been invited.</p>
    <a href="${link}">Join Now</a>
  `;
}
