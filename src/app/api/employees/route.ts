// app/api/employees/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { mes } from "@/lib/database";

interface Employee {
  id: string;
  emp_code: string;
  name: string;
  access: string;
  department: string;
  designation: string;
  email: string;
  photo: string | null;
  [key: string]: any;
}

interface Photo {
  uid: string;
  filename: string;
  ext: string;
  folder: string | null;
}

interface Folder {
  uid: string;
  folder: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get and sanitize the 'id' query parameter
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim() || null;

    // Validate id format (prevent injection - assuming alphanumeric or UUID format)
    if (id && !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Step 1: Get employees
    const sqlEmployees = id
      ? `SELECT * FROM mes.employees e WHERE e.id = ?`
      : `SELECT 
          e.id,
          e.emp_code,
          e.name,
          e.access,
          e.department,
          e.designation,
          e.email 
        FROM mes.employees e`;

    const empRes = await mes.query(sqlEmployees, id ? [id] : []);
    const employees = empRes[0] as Employee[];
    // Return early if no employees found
    if (!employees || employees.length === 0) {
      return NextResponse.json([]);
    }

    // Step 2: Extract employee UIDs
    const employeeUids = employees.map((emp) => emp.id);
    const placeholders = employeeUids.map(() => "?").join(",");

    // Step 3: Get latest photos in a single query
    const sqlPhotos = `
      SELECT 
        r1.uid,
        r1.filename,
        r1.ext,
        r1.folder
      FROM 
        mes.resources r1
      LEFT JOIN 
        mes.resources r2 ON r1.uid = r2.uid 
          AND r1.model = 'employee' 
          AND r2.model = 'employee'
          AND r2.id > r1.id
      WHERE 
        r1.model = 'employee'
        AND r1.uid IN (${placeholders})
        AND r2.id IS NULL
    `;

    const [resPhoto] = await mes.query(sqlPhotos, employeeUids);
    const photos = resPhoto as Photo[];

    // Index photos by uid
    const photosMap = new Map<string, Photo>();
    photos.forEach((photo) => {
      photosMap.set(photo.uid, photo);
    });

    // Step 4: Get fallback folders
    const sqlFolders = `
      SELECT 
        r.uid,
        r.folder
      FROM 
        mes.resources r
      WHERE 
        r.uid IN (${placeholders})
        AND r.folder IS NOT NULL
      GROUP BY 
        r.uid
    `;

    const [resFolders] = await mes.query(sqlFolders, employeeUids);
    const folders = resFolders as Folder[];

    // Index folders by uid
    const foldersMap = new Map<string, string>();
    folders.forEach((folder) => {
      if (!foldersMap.has(folder.uid)) {
        foldersMap.set(folder.uid, folder.folder);
      }
    });

    // Step 5: Merge data
    const finalResult = employees.map((employee) => {
      const uid = employee.id;
      const photo = photosMap.get(uid);

      let photoPath: string | null = null;

      if (photo) {
        const folder = photo.folder || foldersMap.get(uid) || null;

        if (folder && photo.filename && photo.ext) {
          photoPath = `${folder}/${photo.filename}.${photo.ext}`;
        }
      }

      return {
        ...employee,
        photo: photoPath,
      };
    });

    return NextResponse.json(finalResult, {
      status: 200,
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (error) {
    console.error("Database error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
