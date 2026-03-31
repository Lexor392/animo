# Communities Feature

## Purpose

The communities feature is the social core of the platform. It owns community creation, listing, membership and public community presentation.

## Structure

```text
features/communities/
|- api/
|  `- communities.api.ts
|- components/
|  |- CommunityCard/
|  |- CommunityHeader/
|  |- CommunityInfo/
|  |- CommunityJoinButton/
|  |- CommunitySidebar/
|  `- CreateCommunityForm/
|- hooks/
|  |- useCommunities.ts
|  |- useCommunity.ts
|  |- useCreateCommunity.ts
|  |- useJoinCommunity.ts
|  `- useLeaveCommunity.ts
|- pages/
|  |- CommunitiesPage.tsx
|  |- CommunityPage.tsx
|  `- CreateCommunityPage.tsx
|- types/
|  `- community.types.ts
`- README.md
```

## Data Flow

### Create lifecycle

1. User fills `CreateCommunityForm`
2. `useCreateCommunity` validates the payload and triggers `createCommunity`
3. `communities.api.ts` generates a unique slug, uploads media to Supabase Storage and creates:
   - a row in `communities`
   - an owner membership in `community_members`
4. React Query invalidates community lists
5. User is redirected to `/community/:slug`

### Read lifecycle

1. Communities list page loads through `useCommunities`
2. Community detail page loads through `useCommunity`
3. React Query caches both list and detail responses
4. Join and leave actions invalidate related caches

### Membership lifecycle

- `joinCommunity` prevents duplicate joins
- `leaveCommunity` prevents owners from leaving their own community
- membership roles are returned as part of the community view model

## Roles System

Supported roles:

- `owner`
- `admin`
- `moderator`
- `member`

Current implementation:

- owner is assigned automatically during community creation
- members can join and leave
- future-ready structure exists for admin, moderator, settings and moderation flows

## Future Preparation

The feature is intentionally structured to grow into:

- community settings
- role management
- moderation tools
- search and filtering
- pagination enhancements

These are prepared in the type system and feature separation, but not implemented yet.
