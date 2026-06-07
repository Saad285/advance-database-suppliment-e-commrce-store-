import { State, City } from 'country-state-city'
import fs from 'fs'

const generateSQL = () => {
  const pkStates = State.getStatesOfCountry('PK')
  
  let sql = `-- Auto-generated SQL Script using country-state-city real data for Pakistan\n\n`
  sql += `-- Create Provinces Table\n`
  sql += `CREATE TABLE IF NOT EXISTS public.provinces (\n`
  sql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`
  sql += `  name TEXT NOT NULL UNIQUE,\n`
  sql += `  created_at TIMESTAMPTZ DEFAULT now()\n`
  sql += `);\n\n`
  
  sql += `-- Create Cities Table\n`
  sql += `CREATE TABLE IF NOT EXISTS public.cities (\n`
  sql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`
  sql += `  province_id UUID REFERENCES public.provinces(id) ON DELETE CASCADE,\n`
  sql += `  name TEXT NOT NULL,\n`
  sql += `  is_serviceable BOOLEAN DEFAULT true,\n`
  sql += `  created_at TIMESTAMPTZ DEFAULT now(),\n`
  sql += `  UNIQUE(province_id, name)\n`
  sql += `);\n\n`

  sql += `-- Enable RLS and grant read access to all users\n`
  sql += `ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;\n`
  sql += `ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;\n`
  sql += `CREATE POLICY "Allow public read on provinces" ON public.provinces FOR SELECT USING (true);\n`
  sql += `CREATE POLICY "Allow public read on cities" ON public.cities FOR SELECT USING (true);\n`
  sql += `GRANT SELECT ON public.provinces TO anon, authenticated;\n`
  sql += `GRANT SELECT ON public.cities TO anon, authenticated;\n`
  sql += `GRANT ALL ON public.provinces TO service_role;\n`
  sql += `GRANT ALL ON public.cities TO service_role;\n\n`

  sql += `DO $$\n`
  sql += `DECLARE\n`
  pkStates.forEach((state, idx) => {
    sql += `  prov_${idx}_id UUID;\n`
  })
  sql += `BEGIN\n\n`

  pkStates.forEach((state, idx) => {
    const cleanStateName = state.name.replace(/'/g, "''")
    sql += `  -- Insert Province: ${cleanStateName}\n`
    sql += `  INSERT INTO public.provinces (name) VALUES ('${cleanStateName}') ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id INTO prov_${idx}_id;\n`
    sql += `  IF prov_${idx}_id IS NULL THEN SELECT id INTO prov_${idx}_id FROM public.provinces WHERE name = '${cleanStateName}'; END IF;\n\n`

    const cities = City.getCitiesOfState('PK', state.isoCode)
    if (cities.length > 0) {
      sql += `  -- Insert Cities for ${cleanStateName}\n`
      sql += `  INSERT INTO public.cities (province_id, name, is_serviceable) VALUES \n`
      
      const cityValues = cities.map(city => {
        const cleanCityName = city.name.replace(/'/g, "''")
        return `  (prov_${idx}_id, '${cleanCityName}', true)`
      }).join(',\n')
      
      sql += cityValues + `\n  ON CONFLICT DO NOTHING;\n\n`
    }
  })

  sql += `END $$;\n`

  fs.writeFileSync('seed_locations.sql', sql)
  console.log('Successfully generated seed_locations.sql with real Pakistan cities data!')
}

generateSQL()
