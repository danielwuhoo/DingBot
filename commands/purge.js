exports.run = async (client, message, args) => {

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
        message.channel.send(`<@${message.member.id}> does not have permission to use this command`);
        return;
    }

    if (!args.length) {
        message.channel.send('Provide an argument');
        return;
    }

    const amountToDelete = parseInt(args[0]);

    if (isNaN(amountToDelete) || amountToDelete < 1) {
        message.channel.send('Provide a valid argument');
        return;
    }

    await message.channel.bulkDelete(amountToDelete + 1);
};