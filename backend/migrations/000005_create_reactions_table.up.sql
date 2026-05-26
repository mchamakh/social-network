CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id       UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reaction_type VARCHAR(10) NOT NULL CHECK (reaction_type IN ('like', 'dislike')),

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (user_id, post_id)
);
