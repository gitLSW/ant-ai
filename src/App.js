import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Message from './pages/message/Message';
import Account from './pages/account/Account';
import errorImage from './pages/message/images/Error.jpg'

const App = () => {
  const NotFound = <Message title="404 Page Not Found" message="We're sorry, but the page you were looking for could not be found." image={errorImage} />
  // const VerifiedEmail = <Message title="You are verified !" message="You successfully verified your email !" image={verifiedEmailImage} />

  return (
    <div>
      <BrowserRouter>
        <Routes notfound={<NotFound />}>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="account" element={<Account />} />
          {/* <Route path="auth" element={<Auth />} />
          <Route path="operators" element={<OperatorManagement />} />
          <Route path="operator" element={<Operator />} />
          <Route path="operator-auth" element={<OpAuth />} />
          <Route path="subscribe" element={<Subscribe />} />
          <Route path="verify-account">
            <Route path=":activationID" element={<VerifyAccount />} />
          </Route>
          <Route path="verify-email">
            <Route path=":activationID" element={<VerifyEmail />} />
          </Route>
          <Route path="documentation" element={<Documentation />} />
          <Route path="integration" element={<Integration />} />
        
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="reset" element={<Reset />} />
          <Route path="interactions">
            <Route index element={<Interactions />} />
            <Route path=":interactionTopic" element={<Interaction />} />
          </Route> */}
          {/* Default route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
