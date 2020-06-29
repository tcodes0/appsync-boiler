import { Handler } from '../../helpers'
import * as AWS from 'aws-sdk'
const db = new AWS.DynamoDB.DocumentClient()

export const handler: Handler = (event, context, callback, { tables }) => {
  try {
    console.log({ delegatedTo: 'createUser' })
    const {
      arguments: args,
      // identity: { claims, groups, username },
      // request: { headers },
      // info: { variables },
      // prev,
      stash: { newId: id },
    } = event

    const now = new Date().toISOString()
    const {
      admin = false,
      bio,
      birthday,
      city,
      demo = false,
      facebookData,
      facebookEmail,
      gender,
      globalEnabled = true,
      hasChangedBirthday = false,
      hasChangedGender = false,
      hasCreatedPost = false,
      hasEnabledNotifications = false,
      hasHomeOnboarded = false,
      hashTags,
      hasOnboarded = false,
      headline,
      isActive = true,
      lastSeen,
      lat,
      lng,
      maxAgePreference = 50,
      maxDistancePreference = 100,
      minAgePreference = 18,
      name,
      photo1,
      photo2,
      photo3,
      photo4,
      pushId,
      pushStatus,
      pushStatusLikes,
      pushStatusMessages,
      pushToken,
      seekingFemales = true,
      seekingMales = true,
      blockedByIds: blockedBy = [],
      blockedUsersIds: blockedUsers = [],
      claimedConversationsIds: claimedConversations = [],
      createdConversationsIds: createdConversations = [],
      ghostedConversationsIds: ghostedConversations = [],
      interestedInTopicsIds: interestedInTopics = [],
      postLikesReceiveidIds: postLikesReceiveid = [],
      postsIds: posts = [],
      postsLikedIds: postsLiked = [],
      receivedConversationsIds: receivedConversations = [],
      receivedMessagesIds: receivedMessages = [],
      reportedConversationsIds: reportedConversations = [],
      reportedPostsIds: reportedPosts = [],
      savedPostsIds: savedPosts = [],
      sentMessagesIds: sentMessages = [],
      authProvider,
    } = args
    const Item = {
      id,
      auth0UserId: authProvider.auth0 && authProvider.auth0.idToken,
      name,
      headline,
      bio,
      hashTags,
      birthday,
      gender,
      photo1,
      photo2,
      photo3,
      photo4,
      lat,
      lng,
      maxDistancePreference,
      maxAgePreference,
      minAgePreference,
      seekingFemales,
      seekingMales,
      pushToken,
      pushId,
      demo,
      hasChangedBirthday,
      hasChangedGender,
      hasCreatedPost,
      hasHomeOnboarded,
      hasOnboarded,
      hasEnabledNotifications,
      createdAt: now,
      updatedAt: now,
      lastSeen,
      posts,
      createdConversations,
      ghostedConversations,
      receivedConversations,
      reportedConversations,
      receivedMessages,
      sentMessages,
      city,
      email: authProvider.email && authProvider.email.email,
      facebookData,
      facebookEmail,
      password: authProvider.email && authProvider.email.password,
      savedPosts,
      admin,
      blockedBy,
      blockedUsers,
      claimedConversations,
      reportedPosts,
      globalEnabled,
      isActive,
      interestedInTopics,
      postsLiked,
      postLikesReceiveid,
      pushStatus,
      pushStatusLikes,
      pushStatusMessages,
    }
    const params = {
      TableName: tables.users,
      Item,
    }
    console.log({ params })
    db.put(params, err => {
      if (err) {
        // prettier-ignore
        console.log({
          err,
          errName: err.name,
          errorMessage: err.message,
          statusCode: err.statusCode
         })
        callback(err.message, null)
      } else {
        callback(null, Item)
      }
    })
  } catch (catchError) {
    // prettier-ignore
    console.log({
      errorName: catchError.name,
      errorStack: catchError.stack,
      errorMessage: catchError.message,
     })
    callback(catchError.message, null)
  }
}
