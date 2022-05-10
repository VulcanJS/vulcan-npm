import React from "react";
/**
 * @deprecated We expect users to pass custom cells per model,
 * instead of providing cells directly within react-ui
 * (we could move this code to a more specific vulcan-users package if necessary)
 * @returns
 */
export const Avatar = () => {
  return <>Avatar</>;
};
/*
import {
  getDisplayName,
  avatar as avatarUtility,
  getProfileUrl,
} from "meteor/vulcan:users";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { VulcanUser } from "@vulcanjs/permissions";

export const Avatar = ({
  className,
  user,
  size = "medium",
  gutter = "none",
  link = true,
  fallback,
}: {
  user?: VulcanUser;
  className?: string;
  fallback?: any;
  link?: boolean;
  size?: "xsmall" | "small" | "medium" | "large" | "profile";
  gutter?: "bottom" | "left" | "right" | "sides" | "all" | "none";
}) => {
  const avatarClassNames = classNames(
    "avatar",
    `size-${size}`,
    `gutter-${gutter}`,
    className
  );

  if (!user) {
    return <div className={avatarClassNames}>{fallback}</div>;
  }
  const avatarUrl = user.avatarUrl || avatarUtility.getUrl(user);

  const img = (
    <img
      alt={getDisplayName(user)}
      className="avatar-image"
      src={avatarUrl}
      title={user.username}
    />
  );
  const initials = (
    <span className="avatar-initials">
      <span>{avatarUtility.getInitials(user)}</span>
    </span>
  );

  const avatar = avatarUrl ? img : initials;

  return (
    <div className={avatarClassNames}>
      {link ? (
        <Link to={getProfileUrl(user)}>
          <span>{avatar}</span>
        </Link>
      ) : (
        <span>{avatar}</span>
      )}
    </div>
  );
};
*/
