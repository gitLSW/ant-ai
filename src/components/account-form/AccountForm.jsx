// import "./AccountForm.scss"
// import { useState, useEffect } from "react"
// import $api, { hasAuthCredentials } from "../../controller";

// const AccountForm = () => {
//     if (!hasAuthCredentials) {
//         window.location.replace(window.env.CLIENT_URL + '/auth')
//         return null
//     }

//     const [account, setAccount] = useState({});

//     useEffect(async function () {
//         try {
//             const res = await $api.get(`${window.env.API_URL}/account`)
//             const account = res.data;
//             console.log(account)

//             setAccount(account);
//         } catch (e) {
//             console.log(e.message);
//             setData({});
//         }
//     }, []);

//     async function requestPWReset(e) {
//         e.preventDefault();

//         const res = await $api.post(`${window.env.API_URL}/auth/resetpw`);
//         console.log(res.data)
//     }

//     async function changeAccount(e) {
//         e.preventDefault();

//         const res = await $api.post(`${window.env.API_URL}/account`, account);
//         console.log(res.data)
//     }

//     return (
//         <div class="col-xl-8 order-xl-1">
//             <div class="card bg-secondary shadow">
//                 <div class="card-header bg-white border-0">
//                     <div class="row align-items-center">
//                         <div class="col-8">
//                             <h3 class="mb-0">Mein Konto</h3>
//                         </div>
//                         <div class="col-4 text-right">
//                             <button onClick={changeAccount} class="btn btn-sm btn-primary">Speichern</button>
//                         </div>
//                     </div>
//                 </div>
//                 <div class="card-body456">
//                     <form>
//                         <h6 class="heading-small text-muted mb-4">Nutzer Information</h6>
//                         <div class="pl-lg-4">
//                             <div class="row">
//                                 <div class="col-lg-6">
//                                     <div class="form-group">
//                                         <label class="form-control-label" for="input-email">Email-Adresse</label>
//                                         <input type="email" class="form-control-grey form-control-alternative" disabled defaultValue={account.email}></input>
//                                     </div>
//                                 </div>
//                                 <div class="col-lg-6">
//                                     <div class="form-group focused">
//                                         <label class="form-control-label" for="input-email">{account.unverifiedEmail ? "Unverifizierte Email Adresse" : "Neue Email-Adresse"}</label>
//                                         <input type="email" id="input-email" class="form-control form-control-alternative" defaultValue={account.unverifiedEmail}
//                                             onChange={e => account.unverifiedEmail = e.target.value} placeholder="jesse@example.com" />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div class="row">
//                                 <div class="col-lg-6">
//                                     <div class="form-group focused">
//                                         <label class="form-control-label" for="input-first-name">Vorname</label>
//                                         <input type="text" id="input-first-name" class="form-control form-control-alternative" defaultValue={account.firstName}
//                                             onChange={e => account.firstName = e.target.value} placeholder="Vorname" />
//                                     </div>
//                                 </div>

//                                 <div class="col-lg-6">
//                                     <div class="form-group focused">
//                                         <label class="form-control-label" for="input-last-name">Nachname</label>
//                                         <input type="text" id="input-last-name" class="form-control form-control-alternative" defaultValue={account.lastName}
//                                             onChange={e => account.lastName = e.target.value} placeholder="Nachname" />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div class="row">
//                                 <div class="col-lg-6">
//                                     <div class="form-group">
//                                         <label class="form-control-label" for="input-company">Firma (Optional)</label>
//                                         <input type="text" id="input-company" class="form-control form-control-alternative" defaultValue={account.company}
//                                             onChange={e => account.company = e.target.value} placeholder="Firma" />
//                                     </div>
//                                 </div>

//                                 <div class="col-lg-6">
//                                     <div class="form-group">
//                                         <label class="form-control-label" for="input-company">VAT (Optional)</label>
//                                         <input type="text" id="input-vat" class="form-control form-control-alternative" defaultValue={account.vat}
//                                             onChange={e => account.vat = e.target.value} placeholder="VAT" />
//                                     </div>
//                                 </div>
//                             </div>
//                             <button class="btn btn-sm btn-primary" onClick={requestPWReset}>Send password reset link</button>
//                         </div>
//                         <hr class="my-4" /></form>
//                     <h6 class="heading-small text-muted mb-4">Kontakt Information</h6>
//                     <div class="pl-lg-4">
//                         <div class="row">
//                             <div class="col-md-12">
//                                 <div class="form-group focused">
//                                     <label class="form-control-label" for="input-address">Adresse</label>
//                                     <input type="text" id="input-address" class="form-control form-control-alternative" defaultValue={account.street}
//                                         onChange={e => account.street = e.target.value} placeholder="Adresse" />
//                                 </div>
//                             </div>
//                         </div>
//                         <div class="row">
//                             <div class="col-lg-4">
//                                 <div class="form-group focused">
//                                     <label class="form-control-label" for="input-city">Stadt</label>
//                                     <input type="text" id="input-city" class="form-control form-control-alternative" defaultValue={account.city}
//                                         onChange={e => account.city = e.target.value} placeholder="Stadt" />
//                                 </div>
//                             </div>
//                             <div class="col-lg-4">
//                                 <div class="form-group focused">
//                                     <label class="form-control-label" for="input-country">Land</label>
//                                     <input type="text" id="input-country" class="form-control form-control-alternative" defaultValue={account.country}
//                                         onChange={e => account.country = e.target.value} placeholder="Land" />
//                                 </div>
//                             </div>
//                             <div class="col-lg-4">
//                                 <div class="form-group">
//                                     <label class="form-control-label" for="input-country">PLZ</label>
//                                     <input type="text" id="input-postal-code" class="form-control form-control-alternative" defaultValue={account.postalCode}
//                                         onChange={e => account.postalCode = e.target.value} placeholder="PLZ" />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default AccountForm;