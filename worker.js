export default {
    async fetch(request, env) {

        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };


        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }


        if (request.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        try {
            const body = await request.json();
            const { client, car, selectedPlan } = body;


            const supabaseUrl = env.SUPABASE_URL;
            const serviceKey = env.SUPABASE_SERVICE_KEY;

            const headers = {
                "apikey": serviceKey,
                "Authorization": "Bearer " + serviceKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation" 
            };


            const clientRes = await fetch(supabaseUrl + "/rest/v1/clients", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    full_name: client.fullName,
                    age: client.age,
                    experience: client.experience,
                    claims: client.claims,
                    email: client.email,
                    phone: client.phone,
                    address: client.address
                })
            });

            if (!clientRes.ok) {
                const errorText = await clientRes.text();
                return jsonResponse({ error: "Failed to save client: " + errorText }, 400, corsHeaders);
            }

            const clientData = (await clientRes.json())[0];


            const vehicleRes = await fetch(supabaseUrl + "/rest/v1/vehicles", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    client_id: clientData.id,
                    vehicle_type: car.vehicleType,
                    make: car.make,
                    model: car.model,
                    plate_number: car.plateNumber,
                    manufacture_year: car.year,
                    engine_cc: car.engineCc,
                    market_value: car.marketValue,
                    fuel_type: car.fuelType,
                    usage_type: car.usageType,
                    annual_mileage: car.annualMileage,
                    parking: car.parking,
                    region: car.region
                })
            });

            if (!vehicleRes.ok) {
                const errorText = await vehicleRes.text();
                return jsonResponse({ error: "Failed to save vehicle: " + errorText }, 400, corsHeaders);
            }

            const vehicleData = (await vehicleRes.json())[0];


            const quoteRes = await fetch(supabaseUrl + "/rest/v1/quotes", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    client_id: clientData.id,
                    vehicle_id: vehicleData.id,
                    coverage_type: selectedPlan.type,
                    coverage_period_months: selectedPlan.periodMonths,
                    price: selectedPlan.price,
                    payment_status: "fake payment"
                })
            });

            if (!quoteRes.ok) {
                const errorText = await quoteRes.text();
                return jsonResponse({ error: "Failed to save quote: " + errorText }, 400, corsHeaders);
            }

            return jsonResponse({ success: true }, 200, corsHeaders);

        } catch (err) {
            return jsonResponse({ error: "Unexpected error: " + err.message }, 500, corsHeaders);
        }
    }
};

function jsonResponse(obj, status, corsHeaders) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders }
    });
}
