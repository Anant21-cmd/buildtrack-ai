import React from 'react';
import Card from '../../components/common/Card';

const NotificationList = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Notifications</h1>
      <Card><p>You have no new notifications.</p></Card>
    </div>
  );
};
export default NotificationList;

