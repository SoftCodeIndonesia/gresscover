// import prisma from "@/lib/prisma";
// import { ApiResponse } from "@/type/api";
// import { NextApiRequest, NextApiResponse } from "next";
// import { z } from 'zod';


// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse<ApiResponse>
//   ) {
    
//     return res.status(400).json({success: false, data: await req.body, message: 'Email and password are required' });
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({success: false, data: null, message: 'Email and password are required' });
//       }

//     if (req.method === 'POST') {
//         const user = await prisma.users.findUnique({
//             where: {
//                 email: email,
//             }
//         });

//         let data = null;


//         if(user !== null){
//             data = {...user, id: user?.id.toString()};
//         }
        
//         res.status(200).json({
//             success: true,
//             data: data,
//             message: 'LoggedIn!'
//         });


//       } else {
//         res.setHeader('Allow', ['POST']);
//         res.status(405).end(`Method ${req.method} Not Allowed`);
//       }
//   }