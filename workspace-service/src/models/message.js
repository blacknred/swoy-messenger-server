export default (sequelize, DataTypes) => {
    const Message = sequelize.define('message', {
        text: DataTypes.STRING,
        pinned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        forwarded: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        announcement: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        // type: {
        //     type: DataTypes.ENUM,
        //     values: ['channel', 'direct'],
        //     defaultValue: 'channel',
        // },
    }, {
        indexes: [{
            fields: ['created_at'],
        }],
    });

    Message.associate = (models) => {
        Message.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                field: 'user_id',
            },
        });
        Message.belongsTo(models.Channel, {
            foreignKey: {
                name: 'channelId',
                field: 'channel_id',
            },
        });
        // Message.hasMany(models.File, {
        //     hooks: true,
        //     onDelete: 'CASCADE',
        //     // foreignKey: {
        //     //     name: 'messageId',
        //     //     field: 'message_id',
        //     // },
        // });
    };

    return Message;
};