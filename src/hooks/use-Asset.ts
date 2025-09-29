import { useQuery } from "@tanstack/react-query";
import { assets as Asset } from "@prisma/iss";
export const useAsset = (
  id: string
  //   callback?: () => Promise<Response>
): Asset => {
  return useQuery({
    queryKey: ["asset", "id"],
    queryFn: async () => {
      //   callback
      //     ? callback() :
      return fetch(`/api/Assets/asset?id=${id}`).then((res) => res.json);
    },
  });
};
