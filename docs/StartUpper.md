Let's run a startup company inside Bitburner.

Bitburner is an incremental/idle javascript-programming-based game set in a fictional dystopian cyberpunk landscape, with the player as a hacker seeking to make money by hacking company servers. There are shady dealings, hacking jobs, crime, and, of course, automation that *you, the player*, get to write. How fun!

For our spin, we are going to pretend to make a startup company. Let's look at our corporate structure.

# The Corporate Ladder

## CEO

The player is the CEO, obviously™️. And the CEO hires people ~~so they don't have to do the work themself~~ to divide the labor, create jobs, increase jobs, and streamline values.

Tongue-in-cheek bants aside, the CEO makes decisions and makes sure they get carried out. In this case, the player performs the role of decision-maker, by deciding when to carry out certain manual tasks. After all, _you're_ not the one at risk of having their job become automated, right? ....right?

## Account Managers

At the beginning of the company, we're gonna hire a bunch of people. *Big growth! By the bootstraps!* We're gonna do this by having a bunch of account mangers.

Each AM has the following tasks:

- Discuss client needs, gather any requirements, deal with agreements and legal paperwork (`NS.weaken()`)
- Provide value to the client (`NS.grow()`)
- Bill the customer (`NS.hack()`)

The most basic workflow would look like this:

`account_manager.js`:
```js
export async function main(ns) {
  // assuming the account manager has finished their HR onboarding:
  const host = ns.args[0] || ns.read('hostname.txt');
  
  while (true) {
    await ns.weaken(host) // discuss customer needs
	await ns.grow(host)   // provide service value
    await ns.hack(host)   // bill the customer
  }
}
```

That is _super_ rudimentary, and not going to be effective in the long run. As we grow, we'll train the AM's to work in parallel rather than sequence. But for now, that should be enough to get started.

## HR Department

In the salesfolk's job, you might've noticed this interesting line that said, `ns.read('hostname.txt')`.  As you can probably guess, this needs to be populated with some information about the server. 

- Given a server name,
- Get the server's information
- Write the information to a text file (as an info json)
- Upload file to that server