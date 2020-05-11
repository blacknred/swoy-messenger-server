import bcrypt from 'bcryptjs';

import {
    createTokens,
    checkInviteToken,
} from '../../auth';
import {
    formateErrors,
} from '../../helpers';
import {
    requiresAuth,
} from '../../permissions';
import redisClient from '../../redis';

export default {
    User: {
        online: async ({ id }) => !!await redisClient.getAsync(`user_${id}_online`),
    },
    Query: {
        getUser: requiresAuth.createResolver(
            (_, __, { models, user }) => models.User.findByPk(user.id),
        ),
    },
    Mutation: {
        register: async (_, { teamToken, ...args }, { models }) => {
            try {
                // create user
                const user = await models.User.create(args);

                // if there is team invite token, create new member
                if (teamToken) {
                    const { teamId } = await checkInviteToken(teamToken);

                    if (teamId) {
                        await models.TeamMember.create({
                            userId: user.id,
                            teamId,
                        });
                    }
                }

                return {
                    ok: true,
                    user,
                };
            } catch (err) {
                return {
                    ok: false,
                    errors: formateErrors(err, models),
                };
            }
        },
        login: async (_, { email, password, teamToken }, { models }) => {
            try {
                // is user exists
                const user = await models.User.findOne({
                    where: { email }, raw: true,
                });

                if (!user) {
                    return {
                        ok: false,
                        errors: [
                            {
                                path: 'email',
                                message: 'Email not in use',
                            },
                        ],
                    };
                }

                // is password valid
                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return {
                        ok: false,
                        errors: [
                            {
                                path: 'password',
                                message: 'Wrong password',
                            },
                        ],
                    };
                }

                // if there is team invite token, create new member
                if (teamToken) {
                    const { teamId } = await checkInviteToken(teamToken);

                    if (teamId) {
                        await models.TeamMember.create({
                            userId: user.id,
                            teamId,
                        });
                    }
                }

                // create token
                const [token, refreshToken] = await createTokens(user);

                return {
                    ok: true,
                    token,
                    refreshToken,
                };
            } catch (err) {
                console.log(err);
                return {
                    ok: false,
                    errors: formateErrors(err, models),
                };
            }
        },
        updateUser: requiresAuth.createResolver(
            async (_, { option, value }, { models, user }) => {
                try {
                    const [, updatedRows] = await models.User.update(
                        { [option]: value },
                        {
                            where: { id: user.id },
                            returning: true,
                        },
                    );

                    return {
                        ok: true,
                        user: updatedRows[0],
                    };
                } catch (err) {
                    return {
                        ok: false,
                        errors: formateErrors(err, models),
                    };
                }
            },
        ),
        updateUserPassword: requiresAuth.createResolver(
            async (_, { oldPassword, password }, { models, user }) => {
                try {
                    const userData = await models.User.findOne({
                        where: { id: user.id }, raw: true,
                    });

                    // is password valid
                    const isValid = await bcrypt.compare(oldPassword, userData.password);

                    if (!isValid) {
                        return {
                            ok: false,
                            errors: [
                                {
                                    path: 'password',
                                    message: 'Wrong password',
                                },
                            ],
                        };
                    }

                    await models.User.update(
                        { password },
                        { where: { id: user.id } },
                    );

                    return {
                        ok: true,
                    };
                } catch (err) {
                    return {
                        ok: false,
                        errors: formateErrors(err, models),
                    };
                }
            },
        ),
        deleteUser: requiresAuth.createResolver(
            async (_, __, { models, user }) => {
                try {
                    const adminedTeams = await models.TeamMember.findAll({
                        where: { userId: user.id, admin: true },
                        raw: true,
                    });

                    const adminedTeamIds = adminedTeams.map(m => m.teamId);

                    await models.sequelize.transaction(async (transaction) => {
                        await models.User.destroy(
                            { where: { id: user.id } },
                            { transaction },
                        );
                        await models.Team.destroy(
                            { where: { id: adminedTeamIds } },
                            { transaction },
                        );
                    });

                    return true;
                } catch (err) {
                    return false;
                }
            },
        ),
    },
};