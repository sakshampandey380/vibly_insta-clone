import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { Layout } from "../components/layout/Layout";
import { SearchBar } from "../components/search/SearchBar";
import { UserCard } from "../components/search/UserCard";
import { useAuth } from "../contexts/AuthContext";

export function SearchPage() {
  const navigate = useNavigate();
  const { users } = useAuth();
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => user.username.toLowerCase().includes(query.toLowerCase().trim())),
    [users, query]
  );

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="glass-panel rounded-[2rem] p-6 shadow-soft">
          <h1 className="headline-font text-3xl font-semibold text-text">Search creators</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Find other users by username and jump straight into their glassy profile experience.
          </p>
          <div className="mt-5">
            <SearchBar
              query={query}
              onChange={setQuery}
              results={filteredUsers}
              onSelect={(username) => navigate(`/${username}`)}
            />
          </div>
        </div>
        {query && filteredUsers.length === 0 ? (
          <EmptyState
            title="No creators found"
            description="Try a different username or browse the public feed for more inspiration."
          />
        ) : (
          <div className="grid gap-4">
            {(query ? filteredUsers : users).map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

